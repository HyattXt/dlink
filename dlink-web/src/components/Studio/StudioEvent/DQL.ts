import {getJobData} from "@/pages/FlinkSqlStudio/service";

export function showJobData(jobId:string,dispatch:any) {
  if(!jobId){
    return;
  }
  const res = getJobData(jobId);
  res.then((result)=>{
    dispatch&&dispatch({
      type: "Studio/saveResult",
      payload: result.datas,
    });
  });
}
