interface MessageContainerProps {
  message: string;
  linkUrl: string;
  linkText: string;
}

function MessageContainer({
  message,
  linkUrl,
  linkText,
}: MessageContainerProps) {
  return (
    <div className="message-container">
      <p className="message-container-text">{message}</p>
      {linkUrl && linkText && (
        <a className="message-container-link" href={linkUrl}>
          {linkText}
        </a>
      )}
    </div>
  );
}

export default MessageContainer;
