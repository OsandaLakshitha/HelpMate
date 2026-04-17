# ai_server/app.py
from flask import Flask, request, jsonify
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration, AutoTokenizer, AutoModelForSeq2SeqLM
import re
import random
import os

app = Flask(__name__)

# Model paths
MCQ_MODEL_PATH = "./final_mcq_model"
FLASHCARD_MODEL_PATH = "./flashcard_model"
SUMMARIZER_MODEL_PATH = "./summarizer_model"

# Determine device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🖥️ Using device: {device}")

# Model storage
models = {
    "mcq": {"model": None, "tokenizer": None, "loaded": False},
    "flashcard": {"model": None, "tokenizer": None, "loaded": False},
    "summarizer": {"model": None, "tokenizer": None, "loaded": False}
}


def load_t5_model(model_path, model_name):
    """Load a T5 model with multiple fallback methods"""
    print(f"\n📂 Checking {model_name} model at: {model_path}")
    
    # Check if path exists
    if not os.path.exists(model_path):
        print(f"   ❌ Path does not exist: {model_path}")
        return None, None
    
    # List files in directory
    files = os.listdir(model_path)
    print(f"   📁 Files found: {files}")
    
    model = None
    tokenizer = None
    
    # Method 1: Try T5Tokenizer with local_files_only
    try:
        print(f"   🔄 Method 1: T5Tokenizer.from_pretrained()")
        tokenizer = T5Tokenizer.from_pretrained(model_path, local_files_only=True)
        model = T5ForConditionalGeneration.from_pretrained(model_path, local_files_only=True)
        print(f"   ✅ Method 1 succeeded!")
        return model, tokenizer
    except Exception as e:
        print(f"   ⚠️ Method 1 failed: {str(e)[:100]}")
    
    # Method 2: Try AutoTokenizer
    try:
        print(f"   🔄 Method 2: AutoTokenizer.from_pretrained()")
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True)
        print(f"   ✅ Method 2 succeeded!")
        return model, tokenizer
    except Exception as e:
        print(f"   ⚠️ Method 2 failed: {str(e)[:100]}")
    
    # Method 3: Try with legacy=True for T5Tokenizer
    try:
        print(f"   🔄 Method 3: T5Tokenizer with legacy=True")
        tokenizer = T5Tokenizer.from_pretrained(model_path, local_files_only=True, legacy=True)
        model = T5ForConditionalGeneration.from_pretrained(model_path, local_files_only=True)
        print(f"   ✅ Method 3 succeeded!")
        return model, tokenizer
    except Exception as e:
        print(f"   ⚠️ Method 3 failed: {str(e)[:100]}")
    
    # Method 4: Try loading with specific files
    try:
        print(f"   🔄 Method 4: Load with t5-small tokenizer + local model")
        tokenizer = T5Tokenizer.from_pretrained("t5-small")
        model = T5ForConditionalGeneration.from_pretrained(model_path, local_files_only=True)
        print(f"   ✅ Method 4 succeeded!")
        return model, tokenizer
    except Exception as e:
        print(f"   ⚠️ Method 4 failed: {str(e)[:100]}")
    
    # Method 5: Try t5-base tokenizer
    try:
        print(f"   🔄 Method 5: Load with t5-base tokenizer + local model")
        tokenizer = T5Tokenizer.from_pretrained("t5-base")
        model = T5ForConditionalGeneration.from_pretrained(model_path, local_files_only=True)
        print(f"   ✅ Method 5 succeeded!")
        return model, tokenizer
    except Exception as e:
        print(f"   ⚠️ Method 5 failed: {str(e)[:100]}")
    
    return None, None


# Load MCQ Model
print("\n📚 Loading MCQ model...")
try:
    mcq_model, mcq_tokenizer = load_t5_model(MCQ_MODEL_PATH, "MCQ")
    if mcq_model and mcq_tokenizer:
        mcq_model.to(device)
        mcq_model.eval()
        models["mcq"] = {"model": mcq_model, "tokenizer": mcq_tokenizer, "loaded": True}
        print("✅ MCQ Model loaded successfully!")
    else:
        print("❌ MCQ Model failed to load")
except Exception as e:
    print(f"❌ Error loading MCQ model: {e}")

# Load Flashcard Model
print("\n🎴 Loading Flashcard model...")
try:
    fc_model, fc_tokenizer = load_t5_model(FLASHCARD_MODEL_PATH, "Flashcard")
    if fc_model and fc_tokenizer:
        fc_model.to(device)
        fc_model.eval()
        models["flashcard"] = {"model": fc_model, "tokenizer": fc_tokenizer, "loaded": True}
        print("✅ Flashcard Model loaded successfully!")
    else:
        print("❌ Flashcard Model failed to load")
except Exception as e:
    print(f"❌ Error loading Flashcard model: {e}")

# Load Summarizer Model
print("\n📝 Loading Summarizer model...")
try:
    sum_model, sum_tokenizer = load_t5_model(SUMMARIZER_MODEL_PATH, "Summarizer")
    if sum_model and sum_tokenizer:
        sum_model.to(device)
        sum_model.eval()
        models["summarizer"] = {"model": sum_model, "tokenizer": sum_tokenizer, "loaded": True}
        print("✅ Summarizer Model loaded successfully!")
    else:
        print("❌ Summarizer Model failed to load")
except Exception as e:
    print(f"❌ Error loading Summarizer model: {e}")


# Print status
print("\n" + "=" * 50)
print("📊 Model Status:")
print(f"   MCQ Model: {'✅ Loaded' if models['mcq']['loaded'] else '❌ Not Loaded'}")
print(f"   Flashcard Model: {'✅ Loaded' if models['flashcard']['loaded'] else '❌ Not Loaded'}")
print(f"   Summarizer Model: {'✅ Loaded' if models['summarizer']['loaded'] else '❌ Not Loaded'}")
print("=" * 50)


# ==================== MCQ FUNCTIONS ====================

def parse_mcq_text(text):
    """Parse generated text into MCQ format"""
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
    """Check if MCQ is valid"""
    return (
        mcq.get("question") and 
        len(mcq.get("question", "")) > 10 and
        len(mcq.get("options", [])) >= 4 and
        mcq.get("answer") in ["A", "B", "C", "D"]
    )


# ==================== FLASHCARD FUNCTIONS ====================

def parse_flashcard_text(text):
    """Parse generated text into flashcard format"""
    front = None
    back = None
    
    # Try different patterns
    patterns = [
        r"Front:\s*(.+?)\s*Back:\s*(.+)",
        r"front:\s*(.+?)\s*back:\s*(.+)",
        r"Q:\s*(.+?)\s*A:\s*(.+)",
        r"Question:\s*(.+?)\s*Answer:\s*(.+)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.I | re.DOTALL)
        if match:
            front = match.group(1).strip()
            back = match.group(2).strip()
            break
    
    # Fallback: split by newline
    if not front and '\n' in text:
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if len(lines) >= 2:
            front = lines[0].replace('Front:', '').replace('front:', '').strip()
            back = lines[1].replace('Back:', '').replace('back:', '').strip()
    
    return {"front": front, "back": back}


def is_valid_flashcard(card):
    """Check if flashcard is valid"""
    return (
        card.get("front") and 
        card.get("back") and
        len(card["front"]) > 5 and 
        len(card["back"]) > 5
    )


# ==================== MCQ ENDPOINTS ====================

@app.route('/generate-single', methods=['POST'])
def generate_single_mcq():
    """Generate single MCQ"""
    if not models["mcq"]["loaded"]:
        return jsonify({"error": "MCQ model not loaded", "mcq": None}), 503
    
    data = request.json
    text = data.get('text', '').strip()
    
    if not text or len(text.split()) < 5:
        return jsonify({"error": "Text too short", "mcq": None}), 400
    
    try:
        tokenizer = models["mcq"]["tokenizer"]
        model = models["mcq"]["model"]
        
        prompt = f"generate mcq: {text}"
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=True,
                temperature=random.uniform(0.7, 1.0),
                top_p=0.9,
                top_k=50,
            )
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        mcq = parse_mcq_text(result)
        
        if is_valid_mcq(mcq):
            return jsonify({"mcq": mcq})
        else:
            return jsonify({"mcq": None, "error": "Invalid MCQ format"})
            
    except Exception as e:
        return jsonify({"mcq": None, "error": str(e)}), 500


@app.route('/generate-mcq', methods=['POST'])
def generate_mcq_batch():
    """Generate multiple MCQs (legacy)"""
    if not models["mcq"]["loaded"]:
        return jsonify({"error": "MCQ model not loaded"}), 503
    
    data = request.json
    text = data.get('text', '').strip()
    num_questions = data.get('num_questions', 10)
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    mcqs = []
    tokenizer = models["mcq"]["tokenizer"]
    model = models["mcq"]["model"]
    
    for _ in range(min(num_questions, 15)):
        try:
            prompt = f"generate mcq: {text[:1000]}"
            inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
            
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=200,
                    do_sample=True,
                    temperature=random.uniform(0.7, 1.0),
                    top_p=0.9,
                )
            
            result = tokenizer.decode(outputs[0], skip_special_tokens=True)
            mcq = parse_mcq_text(result)
            
            if is_valid_mcq(mcq):
                mcqs.append(mcq)
        except:
            pass
    
    return jsonify({"mcqs": mcqs, "count": len(mcqs)})


# ==================== FLASHCARD ENDPOINTS ====================

@app.route('/generate-flashcard', methods=['POST'])
def generate_flashcard():
    """Generate single flashcard"""
    if not models["flashcard"]["loaded"]:
        return jsonify({"error": "Flashcard model not loaded", "flashcard": None}), 503
    
    data = request.json
    text = data.get('text', '').strip()
    
    if not text or len(text.split()) < 5:
        return jsonify({"error": "Text too short", "flashcard": None}), 400
    
    try:
        tokenizer = models["flashcard"]["tokenizer"]
        model = models["flashcard"]["model"]
        
        prompt = f"generate flashcard: {text}"
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=150,
                do_sample=True,
                temperature=random.uniform(0.7, 0.9),
                top_p=0.9,
            )
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        flashcard = parse_flashcard_text(result)
        
        if is_valid_flashcard(flashcard):
            flashcard["type"] = "ai_generated"
            return jsonify({"flashcard": flashcard})
        else:
            return jsonify({"flashcard": None, "error": "Invalid format", "raw": result})
            
    except Exception as e:
        return jsonify({"flashcard": None, "error": str(e)}), 500


@app.route('/generate-flashcard-batch', methods=['POST'])
def generate_flashcard_batch():
    """Generate multiple flashcards"""
    if not models["flashcard"]["loaded"]:
        return jsonify({"error": "Flashcard model not loaded"}), 503
    
    data = request.json
    texts = data.get('texts', [])
    
    flashcards = []
    tokenizer = models["flashcard"]["tokenizer"]
    model = models["flashcard"]["model"]
    
    for text in texts[:20]:
        try:
            prompt = f"generate flashcard: {text}"
            inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
            
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=150,
                    do_sample=True,
                    temperature=random.uniform(0.7, 0.9),
                    top_p=0.9,
                )
            
            result = tokenizer.decode(outputs[0], skip_special_tokens=True)
            flashcard = parse_flashcard_text(result)
            
            if is_valid_flashcard(flashcard):
                flashcard["type"] = "ai_generated"
                flashcards.append(flashcard)
        except:
            pass
    
    return jsonify({"flashcards": flashcards, "count": len(flashcards)})


# ==================== SUMMARIZER ENDPOINTS ====================

@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    """Generate summary from text"""
    if not models["summarizer"]["loaded"]:
        return jsonify({"error": "Summarizer model not loaded", "summary": None}), 503
    
    data = request.json
    text = data.get('text', '').strip()
    
    if not text or len(text.split()) < 10:
        return jsonify({"error": "Text too short", "summary": None}), 400
    
    try:
        tokenizer = models["summarizer"]["tokenizer"]
        model = models["summarizer"]["model"]
        
        # Use the training prompt format
        prompt = f"summarize: {text}"
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=150,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                num_beams=2,
            )
        
        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
        summary = summary.strip()
        
        if len(summary) > 10:
            return jsonify({"summary": summary})
        else:
            return jsonify({"summary": None, "error": "Summary too short"})
            
    except Exception as e:
        return jsonify({"summary": None, "error": str(e)}), 500


@app.route('/generate-summary-batch', methods=['POST'])
def generate_summary_batch():
    """Generate summaries for multiple text chunks"""
    if not models["summarizer"]["loaded"]:
        return jsonify({"error": "Summarizer model not loaded"}), 503
    
    data = request.json
    texts = data.get('texts', [])
    
    summaries = []
    tokenizer = models["summarizer"]["tokenizer"]
    model = models["summarizer"]["model"]
    
    for text in texts[:15]:  # Limit to 15 chunks
        try:
            prompt = f"summarize: {text}"
            inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
            
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=150,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    num_beams=2,
                )
            
            summary = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
            
            if len(summary) > 10:
                summaries.append({"text": text[:100] + "...", "summary": summary})
        except Exception as e:
            print(f"Summary error: {e}")
            pass
    
    return jsonify({"summaries": summaries, "count": len(summaries)})


# ==================== TEST ENDPOINTS ====================

@app.route('/test-mcq', methods=['GET'])
def test_mcq():
    """Test MCQ generation"""
    if not models["mcq"]["loaded"]:
        return jsonify({"error": "MCQ model not loaded"}), 503
    
    test_text = "Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed."
    
    try:
        tokenizer = models["mcq"]["tokenizer"]
        model = models["mcq"]["model"]
        
        prompt = f"generate mcq: {test_text}"
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model.generate(**inputs, max_new_tokens=200, do_sample=True, temperature=0.8)
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        mcq = parse_mcq_text(result)
        
        return jsonify({
            "test": "MCQ Generation",
            "input": test_text,
            "raw_output": result,
            "parsed": mcq,
            "valid": is_valid_mcq(mcq)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/test-flashcard', methods=['GET'])
def test_flashcard():
    """Test flashcard generation"""
    if not models["flashcard"]["loaded"]:
        return jsonify({"error": "Flashcard model not loaded"}), 503
    
    test_text = "Photosynthesis is the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water."
    
    try:
        tokenizer = models["flashcard"]["tokenizer"]
        model = models["flashcard"]["model"]
        
        prompt = f"generate flashcard: {test_text}"
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model.generate(**inputs, max_new_tokens=150, do_sample=True, temperature=0.8)
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        flashcard = parse_flashcard_text(result)
        
        return jsonify({
            "test": "Flashcard Generation",
            "input": test_text,
            "raw_output": result,
            "parsed": flashcard,
            "valid": is_valid_flashcard(flashcard)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/test-summary', methods=['GET'])
def test_summary():
    """Test summarizer"""
    if not models["summarizer"]["loaded"]:
        return jsonify({"error": "Summarizer model not loaded"}), 503
    
    test_text = "The Internet of Things (IoT) refers to a network of interconnected physical devices that collect and exchange data via the internet. These devices include sensors, actuators, and smart devices that can communicate with each other and with cloud-based systems."
    
    try:
        tokenizer = models["summarizer"]["tokenizer"]
        model = models["summarizer"]["model"]
        
        prompt = f"summarize: {test_text}"
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model.generate(**inputs, max_new_tokens=150, do_sample=True, temperature=0.7)
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return jsonify({
            "test": "Summarization",
            "input": test_text,
            "summary": result.strip()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "AI server is running",
        "device": device,
        "models": {
            "mcq": models["mcq"]["loaded"],
            "flashcard": models["flashcard"]["loaded"],
            "summarizer": models["summarizer"]["loaded"]
        }
    })


if __name__ == '__main__':
    print("\n🚀 Starting AI Server on port 4000...")
    app.run(host='0.0.0.0', port=4000, debug=False, threaded=True)
