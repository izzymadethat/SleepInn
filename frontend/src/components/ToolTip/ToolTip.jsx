import "./ToolTip.css";

const ToolTip = ({ text, children }) => {
  return (
    <div className="tooltip">
      {children} <span className="tooltip__text">{text}</span>
    </div>
  );
};

export default ToolTip;
