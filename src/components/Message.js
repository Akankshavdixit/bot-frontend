import React from "react";

const Message = ({ text, type, file }) => {
  return (
    <div className={`message ${type}`}>
      {file ? (
        <a href={file} download className="download-link">
          📄 Download Resource
        </a>
      ) : (
        text
      )}
    </div>
  );
};

export default Message;
