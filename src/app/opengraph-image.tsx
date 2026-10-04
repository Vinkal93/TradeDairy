import { ImageResponse } from 'next/og';
export const alt='TradeDairy — trading journal and brokerage calculator';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function OpenGraphImage(){return new ImageResponse(<div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%',padding:80,background:'#f3f8f5',color:'#12251e',fontFamily:'sans-serif'}}><div style={{display:'flex',fontSize:38,color:'#006948',fontWeight:700}}>TradeDairy</div><div style={{display:'flex',fontSize:68,lineHeight:1.1,fontWeight:700,marginTop:60,maxWidth:970}}>Your trades. Your process. Your journal.</div><div style={{display:'flex',fontSize:28,marginTop:40,color:'#4d6559'}}>Trading journal · Brokerage calculator · Performance review</div><div style={{display:'flex',fontSize:22,marginTop:'auto',color:'#006948'}}>www.tradedairy.online</div></div>,size);}

