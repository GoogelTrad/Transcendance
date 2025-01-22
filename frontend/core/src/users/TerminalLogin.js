import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axiosInstance from '../instance/AxiosInstance';
import logo from '../assets/user/logo.png'
import './TerminalLogin.css';

function TerminalLogin({setModal, launching})
{
    const { setIsAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [lines, setLines] = useState(["Welcome to the Terminal."]);
    const [currentInput, setCurrentInput] = useState("");
    const [currentCommand, setCurrentCommand] = useState(null);
    const [commandArgs, setCommandArgs] = useState([]);
    const [isPassword, setIsPassword] = useState(false);

    const helpLine = [
        {name: "login", value: "You can log in with username and password!"},
        {name: "register", value: "You can register with username, email and password!"},
        {name: "school", value: "You can log in your school login!"},
        {name: "clear", value: "Clear the terminal!"},
        {name: "forms", value: "You can use the forms!"},
        {name: "help", value: "You can have the command list available!"},
    ];

    const commandSteps = {
        login: ["Username", "Password"],
        register: ["Username", "Email", "Password", "Confirm Password"],
        school: [],
        clear: [],
        forms: [],
        help: [],
    };

    const handleForms = () => {
        setModal(true);
        launching({newLaunch: 'forms', setModal: setModal});
    }

    const handleHelp = () => {
        setLines((prevLines) => [...prevLines,
            "Available commands:",
            ...helpLine.map(line => `- ${line.name}: ${line.value}`)
        ]);
    }

    const handleClear = () => {
        setLines(["Welcome to the Terminal."]);
    };

    const handleRegister = async ([username, email, password, confirm_password]) => {
        const data = new FormData();
        data.append("name", username);
        data.append("email", email);
        data.append("password", password);
        data.append("password_confirm", confirm_password);
        try {
            await axiosInstance.post('api/user/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return "Register successful, you can now login by using 'login' command!";
        } catch (error) {
            return "Error while creating the account!";
        }
    };

    const handleLogin = async ([username, password]) => {
        const data = new FormData();
        data.append("name", username);
        data.append("password", password);
        try {
            await axiosInstance.post('api/login', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsAuthenticated(true);
            navigate("/home");
            return `Login successful! Welcome, ${username}.`;
        } catch (error) {
            return "Login failed. Please check your username and password.";
        }
    };

    const handleCommandExecution = async (command, args) => {
        if (command === "login")
            return await handleLogin(args);
        else if (command === "register")
            return await handleRegister(args);
        else if (command == "school")
            return await handleSchoolLogin();
        else if (command == "clear")
            return await handleClear();
        else if (command == "help")
            return await handleHelp();
        else if (command == "forms")
            return await handleForms();
    };

    const handleSchoolLogin = async (e) => 
        {
            try {
                window.location.href = "http://localhost:8000/auth/code";
            }
            catch(error) {
                return "Error while trying to connect with 42."
            }
        }

    const handleInput = async (input) => {
        if (!currentCommand) {
            const [command] = input.split(" ");
            if (commandSteps[command]) {
                setCurrentCommand(command);
                setCommandArgs([]);
                setLines((prevLines) => [...prevLines, `> ${input}`, `Step 1: Please enter your ${commandSteps[command][0]}:`]);
                setIsPassword(commandSteps[command][0].toLowerCase().includes("password"));
            } else {
                setLines((prevLines) => [...prevLines, `> ${input}`, "Command not found."]);
            }
        } else {
            const step = commandArgs.length;
            const steps = commandSteps[currentCommand];
            const currentStepLabel = steps[step];
            const nextStepLabel = steps[step + 1];

            if (currentStepLabel.toLowerCase().includes("email")) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input)) {
                    setLines((prevLines) => [
                        ...prevLines,
                        `> ${input}`,
                        "Invalid email format. Please try again:",
                    ]);
                    return;
                }
            }
    
            setCommandArgs((prevArgs) => [...prevArgs, input]);
            if (isPassword) {
                setLines((prevLines) => [...prevLines, `> ${"*".repeat(input.length)}`]);
            } else {
                setLines((prevLines) => [...prevLines, `> ${input}`]);
            }
    
            if (step + 1 < steps.length) {
                setLines((prevLines) => [
                    ...prevLines,
                    `Step ${step + 2}: Please enter your ${nextStepLabel}:`,
                ]);
                setIsPassword(nextStepLabel.toLowerCase().includes("password"));
            } else {
                const result = await handleCommandExecution(currentCommand, [...commandArgs, input]);
                setLines((prevLines) => [...prevLines, result]);
                setCurrentCommand(null);
                setCommandArgs([]);
                setIsPassword(false);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (currentInput.trim().length > 0)
            {
                if (currentInput == "school" || currentInput == "clear" || currentInput == "help" || currentInput == "forms")
                    handleCommandExecution(currentInput, null);
                else
                    handleInput(currentInput);
                setCurrentInput("");
            }
        }
    };

    return (
            <div className="terminal-container">
                <div className="terminal-output">
                    {lines.map((line, index) => (
                        <div key={index}>{line}</div>
                    ))}
                </div>
                {!(isPassword) ?
                (
                    <div className="terminal-input">
                    <span>&gt;</span>
                    <input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    </div>
                ) : 
                (
                    <div className="terminal-input">
                    <span>&gt;</span>
                    <input
                        type="password"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    </div>
                )}
            </div>
    );
}

export default TerminalLogin;
