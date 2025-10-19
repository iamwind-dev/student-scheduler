import './QuickAction.css';

export default function QuickAction({ icon, title, description, onClick, color = 'primary' }) {
    return (
        <button className={`quick-action quick-action-${color}`} onClick={onClick}>
            <div className="quick-action-icon">{icon}</div>
            <div className="quick-action-content">
                <div className="quick-action-title">{title}</div>
                <div className="quick-action-desc">{description}</div>
            </div>
        </button>
    );
}
