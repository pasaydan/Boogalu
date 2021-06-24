import React from "react";
import "./Loader.scss";
export default function Loader(props) {
  const toggleLoader = props.value;
  return (
    <>
      {toggleLoader ? (
        <div className="loaderbody">
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
