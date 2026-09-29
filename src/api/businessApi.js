const BUSINESS_API_URL=import.meta.env.VITE_BUSINESS_API_URL;

export const regBusiness=async(businessData)=>{
    const token = localStorage.getItem("accessToken");
    const response=await fetch(BUSINESS_API_URL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${token}`,
        },
        body:JSON.stringify(businessData),
    });
    const data=await response.json();
     if (!response.ok) {
    throw new Error(data.message || "Business registration failed");
  }
  return data;
};