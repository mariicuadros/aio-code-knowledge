/**
 * Temporary Preview-only Meta/Instagram connectivity smoke test.
 * It verifies that Vercel can reach Meta with the configured Instagram credentials.
 * It never returns the access token and refuses to run outside Preview.
 */
const json=(body,status=200)=>new Response(JSON.stringify(body),{
  status,
  headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store'
  }
});

const graphError=(payload)=>({
  code:typeof payload?.error?.code==='number'?payload.error.code:null,
  type:typeof payload?.error?.type==='string'?payload.error.type:null,
  message:'Meta Graph API request failed'
});

export async function GET(){
  if(process.env.VERCEL_ENV!=='preview'){
    return json({status:'preview_only'},404);
  }

  const businessId=process.env.IG_BUSINESS_ID;
  const accessToken=process.env.IG_LONG_TOKEN;
  if(!businessId||!accessToken){
    return json({status:'meta_credentials_not_configured'},503);
  }

  const version=process.env.META_GRAPH_API_VERSION||'v22.0';
  const base=`https://graph.facebook.com/${version}/${encodeURIComponent(businessId)}`;
  const headers={
    accept:'application/json',
    authorization:`Bearer ${accessToken}`
  };

  const accountUrl=new URL(base);
  accountUrl.searchParams.set('fields','id,username,name,followers_count,media_count');

  const mediaUrl=new URL(`${base}/media`);
  mediaUrl.searchParams.set('fields','id,caption,like_count,comments_count,timestamp,media_type');
  mediaUrl.searchParams.set('limit','3');

  try{
    const [accountResponse,mediaResponse]=await Promise.all([
      fetch(accountUrl,{headers}),
      fetch(mediaUrl,{headers})
    ]);
    const [accountBody,mediaBody]=await Promise.all([
      accountResponse.json(),
      mediaResponse.json()
    ]);

    if(!accountResponse.ok||!mediaResponse.ok){
      return json({
        status:'meta_request_failed',
        graph_api_version:version,
        account:accountResponse.ok?'ok':graphError(accountBody),
        media:mediaResponse.ok?'ok':graphError(mediaBody)
      },502);
    }

    return json({
      status:'ok',
      checked_at:new Date().toISOString(),
      graph_api_version:version,
      account:{
        id:accountBody.id??null,
        username:accountBody.username??null,
        name:accountBody.name??null,
        followers_count:accountBody.followers_count??null,
        media_count:accountBody.media_count??null
      },
      media:(mediaBody.data||[]).map(item=>({
        id:item.id??null,
        media_type:item.media_type??null,
        timestamp:item.timestamp??null,
        like_count:item.like_count??null,
        comments_count:item.comments_count??null,
        caption:typeof item.caption==='string'?item.caption.slice(0,120):null
      }))
    });
  }catch{
    return json({status:'upstream_unreachable'},502);
  }
}
