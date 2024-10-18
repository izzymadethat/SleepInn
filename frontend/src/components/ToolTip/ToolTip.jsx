import "./ToolTip.css";

const ToolTip = ({ text, children, ...props }) => {
  return (
    <div className="tooltip" onClick={props.onClick} data-testid="spot-tooltip">
      {children}
      <span className="tooltip__text">{text}</span>
    </div>
  );
};

export default ToolTip;
