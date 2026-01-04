# ai_server/app.py
from flask import Flask, request, jsonify
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
import re
import random

app = Flask(__name__)

MODEL_PATH = "./final_mcq_model"

print("Loading T5 model...")

try:
    tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH)
    model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    model.to(device)
    model.eval()
except Exception as e:
    print("❌ Error loading model:", str(e))
    exit(1)

print("✅ Model loaded successfully!")


def parse_generated_text(text):
    """Parse the generated text into structured MCQ format"""
    question = None
    options = []
    answer = None

    q_match = re.search(r"question:\s*(.+?)(?:\s*options:|$)", text, re.I | re.DOTALL)
    o_match = re.search(r"options:\s*(.+?)(?:\s*answer:|$)", text, re.I | re.DOTALL)
    a_match = re.search(r"answer:\s*([A-D])", text, re.I)

    if q_match:
        question = q_match.group(1).strip()

    if o_match:
        raw_opts = o_match.group(1).strip()
        cleaned = re.sub(r'\s+', ' ', raw_opts)
        parts = re.split(r'(?=\b[A-D]\))', cleaned)
        options = [p.strip() for p in parts if p.strip() and re.match(r'^[A-D]\)', p.strip())]

    if a_match:
        answer = a_match.group(1).upper()

    return {"question": question, "options": options, "answer": answer}


def is_valid_mcq(mcq):
    """Check if MCQ has all required components"""
    return (
        mcq.get("question") and 
        len(mcq.get("question", "")) > 10 and
        len(mcq.get("options", [])) >= 4 and
        mcq.get("answer") in ["A", "B", "C", "D"]
    )


# ============== SINGLE MCQ ENDPOINT (NEW!) ==============

@app.route('/generate-single', methods=['POST'])
def generate_single():
    """Generate ONE MCQ from a text chunk - called multiple times by backend"""
    data = request.json
    text = data.get('text', '').strip()
    
    if not text or len(text.split()) < 5:
        return jsonify({"error": "Text too short", "mcq": None}), 400
    
    # Random temperature for variety
    temperature = random.uniform(0.7, 1.0)
    
    prompt = f"generate mcq: {text}"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
    
    try:
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=True,
                temperature=temperature,
                top_p=0.9,
                top_k=50,
            )
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        mcq = parse_generated_text(result)
        
        if is_valid_mcq(mcq):
            return jsonify({"mcq": mcq})
        else:
            return jsonify({"mcq": None, "error": "Invalid MCQ format"})
            
    except Exception as e:
        return jsonify({"mcq": None, "error": str(e)}), 500


# ============== BATCH ENDPOINT (KEPT FOR COMPATIBILITY) ==============

@app.route('/generate-mcq', methods=['POST'])
def generate_mcq():
    """Generate multiple MCQs - legacy endpoint"""
    data = request.json
    input_text = data.get('text', '').strip()
    num_questions = data.get('num_questions', 20)

    if not input_text:
        return jsonify({"error": "No input text provided"}), 400

    # Just generate a few from the full text
    mcqs = []
    
    for i in range(min(num_questions, 10)):
        temp = random.uniform(0.7, 1.0)
        
        prompt = f"generate mcq: {input_text[:1000]}"  # First 1000 chars
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        try:
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=200,
                    do_sample=True,
                    temperature=temp,
                    top_p=0.9,
                )
            
            result = tokenizer.decode(outputs[0], skip_special_tokens=True)
            mcq = parse_generated_text(result)
            
            if is_valid_mcq(mcq):
                mcqs.append(mcq)
        except:
            pass
    
    return jsonify({
        "mcqs": mcqs,
        "unique_count": len(mcqs),
        "requested": num_questions
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "AI server is running",
        "device": device,
        "model": "T5-base fine-tuned for MCQ generation"
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=False, threaded=True)