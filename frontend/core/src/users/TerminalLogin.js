import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axiosInstance from '../instance/AxiosInstance';
import logo from '../assets/user/logo.png';
import './TerminalLogin.css';
import AuthSchool from './AuthSchool';
import { ValidatePassword } from './LoginForm';
import { showToast } from '../instance/ToastsInstance';


function TerminalLogin({ setModal, launching, setTerminal, removeLaunch }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [lines, setLines] = useState(['Welcome to the Terminal. Type "help" to see commands.']);
    const [isTwoFactorRequired, setIsTwoFactorRequired] = useState(false);
    const [currentInput, setCurrentInput] = useState("");
    const [currentCommand, setCurrentCommand] = useState(null);
    const currentCommandRef = useRef(null);
    const [commandArgs, setCommandArgs] = useState([]);
    const [isPassword, setIsPassword] = useState(false);
    const [name, setName] = useState("");
    const [isSchool, setIsSchool] = useState(false);

    const helpLine = [
        { name: "login", value: "You can log in with username and password!" },
        { name: "register", value: "You can register with username, email and password!" },
        { name: "school", value: "You can log in your school login!" },
        { name: "clear", value: "Clear the terminal!" },
        { name: "forms", value: "You can use the forms!" },
        { name: "help", value: "You can have the command list available!" },
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
        launching({ newLaunch: 'forms', setModal: setModal });
    };

    const handleHelp = () => {
        setLines((prevLines) => [
            ...prevLines,
            "Available commands:",
            ...helpLine.map(line => `- ${line.name}: ${line.value}`)
        ]);
    };

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
        setName(username);
        data.append("password", password);
        try {
            const response = await axiosInstance.post('/api/user/login', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 401) {
                setIsTwoFactorRequired(true);
                return "2FA required. Please enter the code sent to your email.";
            } else if (response.status === 200) {
                login();
                setTerminal(false);
                removeLaunch('terminal');
                removeLaunch('forms');
                navigate('/home');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setIsTwoFactorRequired(true);
                return "2FA required. Please enter the code sent to your email.";
            }
            return "Login failed. Please check your username and password.";
        }
    };

    const handleTwoFactorVerification = async (code, name) => {
        try {
            const response = await axiosInstance.post('/api/user/code', { code: code, name: name });
            if (response.status === 200) {
                login();
                setTerminal(false);
                removeLaunch('terminal');
                removeLaunch('forms');
                navigate('/home');
                return "2FA verification successful! You are now logged in.";
            } else {
                return "Invalid 2FA code. Please try again.";
            }
        } catch (error) {
            return "Error during 2FA verification. Please try again.";
        }
    };

    const handleCommandExecution = async (command, args) => {
        if (command === "login")
            return await handleLogin(args);
        else if (command === "register")
            return await handleRegister(args);
        else if (command === "school")
            return handleSchoolLogin();
        else if (command === "clear")
            return await handleClear();
        else if (command === "help")
            return await handleHelp();
        else if (command === "forms")
            return await handleForms();
    };

    const handleSchoolLogin = () => {
        setIsSchool(true);
    };

    const cancelCommand = () => {
        setCurrentCommand(null);
        currentCommandRef.current = null;
        setCommandArgs([]);
        setIsPassword(false);
        setIsTwoFactorRequired(false);
        setLines((prevLines) => [...prevLines, "> Command cancelled with Ctrl+C"]);
        setCurrentInput("");
    };

    const handleInput = async (input) => {
        if (isTwoFactorRequired) {
            const result = await handleTwoFactorVerification(input, name);
            setLines((prevLines) => [...prevLines, `> ${input}`, result]);

            if (result.includes("successful"))
                setIsTwoFactorRequired(false);
            return;
        }
        
        if (!currentCommandRef.current) {
            const [command] = input.split(" ");

            if (commandSteps[command] && commandSteps[command].length > 0) {
                currentCommandRef.current = command;
                setCurrentCommand(command);
                setCommandArgs([]);
                setLines((prevLines) => [...prevLines, `> ${input}`, `Step 1: Please enter your ${commandSteps[command][0]}:`]);
                setIsPassword(commandSteps[command][0].toLowerCase().includes("password"));
            } else {
                setLines((prevLines) => [...prevLines, `> ${input}`, "Command not found."]);
            }
        } else {
            const step = commandArgs.length;
            const steps = commandSteps[currentCommandRef.current];
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
            if (currentStepLabel.toLowerCase().includes("password") && currentCommandRef.current === "register") {
                if (!ValidatePassword(input)) {
                    const maskedInput = input.replace(/./g, '*');
                    setLines((prevLines) => [
                        ...prevLines,
                        `> ${maskedInput}`,
                        "The password must be at least 8 characters long, 1 uppercase, 1 lowercase, 1 number and 1 special character (@$!%*?&).",
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
                currentCommandRef.current = null;
                setCommandArgs([]);
                setIsPassword(false);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'c') { 
            e.preventDefault();
            cancelCommand();
            return;
        }
    
        if (e.key === "Enter") {
            e.preventDefault();
            if (currentInput.trim().length > 0) {
                if (currentCommand) { 
                    handleInput(currentInput);
                } else if (currentInput === "school" || currentInput === "clear" || currentInput === "help" || currentInput === "forms") {
                    handleCommandExecution(currentInput, null); 
                } else {
                    handleInput(currentInput);
                }
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
            {!(isPassword) ? (
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
            ) : (
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

            {isSchool ? (<AuthSchool noButton={true}/>) : (null)}
        </div>
    );
}

export default TerminalLogin;