import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/api";

export default function BInsights(){

  const { token } = useAuth();

  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    const load = async()=>{

      try{

        const res = await fetch(
          `${API_URL}/api/prediction/student-overall`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        );

        const json = await res.json();

        setData(json.overall);

      }catch(e){
        console.log(e);
      }

      setLoading(false);

    };

    load();

  },[token]);



  if(loading){
    return <div style={{padding:40}}>Loading analytics...</div>
  }


  if(!data){
    return <div style={{padding:40}}>No performance data yet</div>
  }



  return(

    <div style={styles.page}>

      <h1 style={styles.title}>Student Insights</h1>


      {/* Overall Score */}

      <div style={styles.scoreCard}>

        <p style={styles.label}>Overall Performance</p>

        <p style={styles.score}>{data.score}</p>

        <p style={styles.status}>{data.status}</p>

      </div>



      {/* Metrics */}

      <div style={styles.grid}>

        <Metric
          title="Trajectory"
          value={data.trajectory}
          desc="Long term progress"
        />

        <Metric
          title="Resilience"
          value={data.resilience}
          desc="Recovery ability"
        />

        <Metric
          title="Work Pace"
          value={data.pace+"x"}
          desc="Speed vs expected"
        />

        <Metric
          title="Active Projects"
          value={data.projectCount}
          desc="Current workload"
        />

      </div>



      {/* Explanation */}

      <div style={styles.infoCard}>

        <p style={styles.infoTitle}>Performance Explanation</p>

        <p style={styles.infoText}>
          This score is calculated using your trajectory (progress vs time),
          resilience (ability to recover from delays), and work pace
          (task completion speed). The system analyzes all active projects
          and produces an overall academic performance score.
        </p>

      </div>


    </div>

  );

}



function Metric({title,value,desc}){

  return(

    <div style={styles.metric}>

      <p style={styles.label}>{title}</p>

      <p style={styles.value}>{value}</p>

      <p style={styles.desc}>{desc}</p>

    </div>

  )

}



const styles={

page:{
  padding:24,
  background:"#f8fafc",
  minHeight:"100vh"
},

title:{
  fontSize:26,
  fontWeight:700,
  marginBottom:24
},

scoreCard:{
  background:"#fff",
  padding:28,
  borderRadius:12,
  boxShadow:"0 2px 6px rgba(0,0,0,0.08)",
  marginBottom:24,
  textAlign:"center"
},

score:{
  fontSize:48,
  fontWeight:700,
  color:"#3b82f6",
  margin:0
},

status:{
  color:"#64748b",
  fontSize:14
},

grid:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
  gap:16,
  marginBottom:24
},

metric:{
  background:"#fff",
  padding:18,
  borderRadius:10,
  boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
},

label:{
  fontSize:12,
  color:"#64748b"
},

value:{
  fontSize:26,
  fontWeight:700
},

desc:{
  fontSize:11,
  color:"#94a3b8"
},

infoCard:{
  background:"#fff",
  padding:20,
  borderRadius:10,
  boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
},

infoTitle:{
  fontWeight:600,
  marginBottom:6
},

infoText:{
  fontSize:13,
  color:"#64748b",
  lineHeight:1.5
}

};