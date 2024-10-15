import "./ToolTip.css";

const ToolTip = ({ text, children, ...props }) => {
  return (
    <div className="tooltip" onClick={props.onClick}>
      {children} <span className="tooltip__text">{text}</span>
    </div>
  );
};

export default ToolTip;
