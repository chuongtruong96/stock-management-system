// Path: src/hooks/useOrderProgress.js
import { useEffect, useState, useContext } from "react";
import { WsContext } from "context/WsContext";
export default function useOrderProgress(orderId, deptId){
  const { subscribe } = useContext(WsContext);
  const [status,setStatus] = useState(null);
  useEffect(()=>{
    if(!deptId) return;
    let off;
    (async()=>{ off = await subscribe(`/topic/orders/${deptId}`, msg => {
      if(msg.orderId===orderId) setStatus(msg.status);
    });})();
    return ()=> off && off();
  },[deptId,orderId,subscribe]);
  return status;
}