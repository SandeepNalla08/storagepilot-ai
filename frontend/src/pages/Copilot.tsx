import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function Copilot() {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello. I can help analyze cluster health, volumes, SVMs, aggregates, and storage alerts.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const sendQuestion = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/copilot/chat",
        {
          question: trimmedQuestion,
        }
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content:
            response.data.answer ??
            "No response was returned by StoragePilot.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content:
            "I could not reach the StoragePilot Copilot backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>AI Copilot</h2>

          <p>
            Ask questions about storage health, alerts, capacity,
            and ONTAP infrastructure.
          </p>
        </div>
      </div>

      <section className="copilot-layout">
        <div className="copilot-main panel">
          <div className="chat-header">
            <div>
              <h3>Storage Assistant</h3>

              <p>
                StoragePilot infrastructure intelligence
              </p>
            </div>

            <span className="copilot-online">
              <span className="health-dot"></span>
              Online
            </span>
          </div>

          <div className="chat-window">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "chat-row chat-row-user"
                    : "chat-row"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "chat-message chat-user"
                      : "chat-message chat-assistant"
                  }
                >
                  <div className="chat-role">
                    {message.role === "user"
                      ? "You"
                      : "StoragePilot AI"}
                  </div>

                  <div>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-row">
                <div className="chat-message chat-assistant">
                  <div className="chat-role">
                    StoragePilot AI
                  </div>

                  Analyzing storage environment...
                </div>
              </div>
            )}
          </div>

          <form
            className="chat-form"
            onSubmit={sendQuestion}
          >
            <input
              type="text"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="Ask about storage health, alerts, volumes..."
            />

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Send"}
            </button>
          </form>
        </div>

        <div className="copilot-side panel">
          <h3>Suggested Questions</h3>

          <button
            className="suggestion-button"
            onClick={() =>
              setQuestion(
                "What is wrong with backup_data?"
              )
            }
          >
            What is wrong with backup_data?
          </button>

          <button
            className="suggestion-button"
            onClick={() =>
              setQuestion(
                "Which alerts are critical?"
              )
            }
          >
            Which alerts are critical?
          </button>

          <button
            className="suggestion-button"
            onClick={() =>
              setQuestion(
                "Show me the health of my storage environment."
              )
            }
          >
            Show environment health
          </button>

          <button
            className="suggestion-button"
            onClick={() =>
              setQuestion(
                "How many volumes do I have?"
              )
            }
          >
            How many volumes do I have?
          </button>

          <button
            className="suggestion-button"
            onClick={() =>
              setQuestion(
                "How many SVMs are running?"
              )
            }
          >
            How many SVMs are running?
          </button>

          <button
            className="suggestion-button"
            onClick={() =>
              setQuestion(
                "What is the aggregate status?"
              )
            }
          >
            What is the aggregate status?
          </button>
        </div>
      </section>
    </div>
  );
}

export default Copilot;