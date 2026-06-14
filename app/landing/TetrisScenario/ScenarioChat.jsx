import styles from "./TetrisScenario.module.css";

export default function ScenarioChat({ messages, isTyping = false }) {
  return (
    <div className={styles.chatPanel}>
      <header className={styles.chatHeader}>
        <span className={styles.chatBadge}>AI 도우미</span>
        <h3 className={styles.chatTitle}>채팅</h3>
      </header>

      <ul className={styles.messageList} aria-live="polite">
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.role === "user" ? styles.userMessage : styles.aiMessage
            }
          >
            <span className={styles.messageLabel}>
              {message.role === "user" ? "나" : "AI"}
            </span>
            <p>{message.text}</p>
          </li>
        ))}

        {isTyping && (
          <li className={styles.aiMessage}>
            <span className={styles.messageLabel}>AI</span>
            <p className={styles.typingDots}>
              <span />
              <span />
              <span />
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
