import { IoSend } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import { IoCloseCircleSharp, IoTrashBinSharp } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";

export default function App() {

  const backend = import.meta.env.VITE_BACKEND
  const [status, setStatus] = useState(false)

  const [bg, setBg] = useState("https://www.bing.com/th?id=OADD2.8108974874792_168XT7JK8YQNFTKJA9&pid=21.2&c=17&roil=0&roit=0&roir=1&roib=1&w=300&h=300&dynsize=1&qlt=90");
  const [ask, sendMessage] = useState([]);
  const [input, setInput] = useState("");

  const [setting, setSetting] = useState(false);
  const [role, setRole] = useState("");
  const [memory, setMemory] = useState("");

  const bottomRef = useRef(null);

  // Load saved messages from localStorage on mount
  useEffect(() => {
    handleSend('hi', "user");
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      sendMessage(JSON.parse(savedMessages));
    }
  }, []);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ask]);

  // Handle sending messages
  const handleSend = async (messageText, roleType) => {

    if (!messageText.trim()) return;

    const timestamp = new Date().toLocaleTimeString();

    // Add user/system message
   if(roleType!=='system'){
     sendMessage((prev) => {
      const newMessages = [
        ...prev,
        { role: roleType, mess: messageText, time: timestamp },
      ];
      localStorage.setItem("chatMessages", JSON.stringify(newMessages));
      return newMessages;
    });

   }
    setInput("");

    // Only call API if role is not 'system'

    try {
      const res = await fetch(`${backend}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleType, ask: messageText }),
      });
      const data = await res.json();
      const aitimestamp = new Date().toLocaleTimeString();
      setStatus(true)

      // Add AI reply
      sendMessage((prev) => {
        const newMessages = [
          ...prev,
          { role: "assistant", mess: data.reply, time: aitimestamp },
        ];
        localStorage.setItem("chatMessages", JSON.stringify(newMessages));
        return newMessages;
      });
    } catch (err) {
      console.error("Error:", err);
    }

  };

  // Clear chat messages
  const clearChat = async () => {
    sendMessage([]);
    localStorage.removeItem("chatMessages");
    setInput("");
    setRole("");
    setMemory("");
    const req = await fetch(`${backend}/clear`)
    const result = await req.json()
    if (result.status == 'success') {
      alert("Chat cleared!");
    }

  };

  return (
    <>
      <div className="fixed w-full">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#202c33] px-5 h-[60px]">
          <div className="flex items-center  gap-4 md:text-xl  text-center sticky tracking-wider">
            <img src="https://lh7-us.googleusercontent.com/dJPHFdm0kCPsHm2OoKoUVSwoXlOzubs0pCR6aiQlWdQUX5934KvF_pTZjO9QsEMWi9pMLQt6RZxAjVNHlMUlFG2uHfeFjZJrX6Ty83PknMj_PSTjCw1cUGl5DaZfPkiPPypiVk8h8uuEJZfQ-rWi3FY" alt="" className="w-10 h-10 rounded-[100%]" />
            <span className=" text-white flex flex-col  ">
              <span>Chatting ai</span>
              <span className='text-xs  w-fit'>{status ? 'online' : 'offline'}</span>
            </span>
          </div>

          <div className="flex gap-10 text-white">
            <div
              onClick={() => setSetting(true)}
              className="flex flex-col items-center capitalize cursor-pointer"
            >
              <IoMdSettings className=" md:text-xl" />
              <span className="hidden md:block text-xs ">setting</span>
            </div>
            <div
              onClick={clearChat}
              className="flex flex-col items-center capitalize cursor-pointer"
            >
              <IoTrashBinSharp className="md:text-xl" />
              <span className="hidden md:block text-xs">clear history</span>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {setting && (
          <div className="absolute z-10 p-4 gap-4 min-h-[200px] top-20 rounded-xl items-center bg-white right-5 flex flex-col">
            <span className="relative w-full">
              <h1 className="mt-10 text-green-800 uppercase font-bold text-2xl">
                Define your Virtual character
              </h1>
              <IoCloseCircleSharp
                onClick={() => setSetting(false)}
                className="absolute top-5 right-5 text-xl cursor-pointer"
              />
            </span>

            <label
              htmlFor="role"
              className="border-2 rounded-xl p-2 w-full hover:border-green-600"
            >
              <span>Role: </span>
              <textarea
                className="w-full p-4"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                type="text"
                name="role"
                id="role"
                placeholder="define role like teacher, wife, friend etc"
              />
            </label>

            <label
              htmlFor="memory"
              className="border-2 rounded-xl p-2 w-full hover:border-green-600 "
            >
              <span>Define Behaviour: </span>
              <textarea
                className="w-full p-4"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                type="text"
                name="memory"
                id="memory"
                placeholder="enter memories"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                const timestamp = new Date().toLocaleTimeString();
                const instruction = `You have to act as ${role} and remember the following rule: ${memory}.
Always speak in Hindi using English letters (Hinglish), not in English or Hindi script.
By default, keep your answers short and concise.
Only give long, detailed answers if I explicitly ask you to.`;
                handleSend(instruction, "system");
                setSetting(false);
              }}
              className="border-2 rounded-xl text-white bg-green-600 text-xl px-10 py-2 w-fit"
            >
              Submit
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div
          className={`bg-[url('https://e0.pxfuel.com/wallpapers/722/149/desktop-wallpaper-message-background-whatsapp-message-background.jpg')] bg-center bg-cover flex flex-col px-5 pt-5 pb-[150px] h-[calc(100vh-60px)] overflow-scroll overflow-x-hidden`}
        >
          {ask.map((message, idx) => (
            <pre
              key={idx}
              className={`mt-5 w-[70vw]  md:w-[200px] md:max-w-[700px] text-white relative pb-5 p-4 rounded-xl font-sans whitespace-pre-wrap ${message.role === "user" ? "bg-green-600 self-end" : "bg-gray-600 justify-end"
                }`}
            >
              {message.role === "user" ? "🙎‍♂️" : "💻"}: {message.mess}
              <span className="text-xs text-gray-300 tracking-wider absolute right-2 bottom-1">
                {message.time}
              </span>
              <div
                className={`absolute bottom-0 ${message.role === "user"
                  ? "right-[-6px] border-l-[14px] border-l-green-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"
                  : "left-[-18px] border-r-[24px] border-r-gray-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"
                  }`}
              ></div>
            </pre>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* Input Box */}
        <div className="bg-white border-2 hover:border-green-600 fixed z-10 bottom-5 left-0 right-0 mx-5 rounded-xl">
          <label htmlFor="UserMessage" className="gap-4 flex items-end justify-between">
            <textarea
              type="text"
              id="UserMessage"
              placeholder="enter your message"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input, "user");
                }
              }}
              rows={1}
              className="w-[90%] max-h-[150px] resize-none rounded-xl outline-none p-2 "
            />
            {input.length > 0 && (
              <IoSend
                onClick={() => handleSend(input, "user")}
                className="text-xl w-[40px] m-2 h-[40px] p-2 bg-green-600 rounded-[100%] cursor-pointer"
              />
            )}
          </label>
        </div>
      </div>
    </>
  );
}