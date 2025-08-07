//avdeep
import React, { useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  font-family: sans-serif;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin: 0.5rem 0 1rem 0;
  padding: 0.5rem;
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  background: indianred;
  color: white;
  font-weight: bold;
  padding: 0.6rem;
  font-size: 1.1rem;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  margin-top: 1rem;

  &:hover {
    background: #b22222;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  margin-top: 1rem;
`;

type LoginProps = {
  onLoginSuccess: (user: any, token: string) => void;
  onClose?: () => void; // allow parent to close modal
};

export default function Login({ onLoginSuccess, onClose }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const token = data.token;

      if (!token) {
        setError("No token returned from server");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);

      const userRes = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userRes.ok) {
        setError("Failed to fetch user info after login");
        setLoading(false);
        return;
      }

      const user = await userRes.json();
      onLoginSuccess(user, token);
      setLoading(false);

      if (onClose) onClose(); // Optionally close modal
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error, please try again");
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={() => onClose && onClose()}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>User Login</Title>
        <Form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="you@example.com"
            autoFocus
          />

          <label htmlFor="password">Password</label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Your password"
          />

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Modal>
    </Overlay>
  );
}
