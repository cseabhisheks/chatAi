import express from 'express'
import cors from 'cors'
import dotenv from "dotenv"
dotenv.config()
import readlineSync from "readline-sync"
import Groq from "groq-sdk"

const app = express()
app.use(cors())
app.use(express.json())
const groq = new Groq({
    apiKey: process.env.Api
})
//role -user (you)
//role -system (rule for system)
//role -assistance (ai response)
const history = [

];

const main = async (req, res) => {
    // const now = new Date()
    // const timestamp = (now.toLocaleDateString() + " " + now.toLocaleTimeString() + ": ")
    // const ask = readlineSync.question(timestamp + " -you: ")
    // console.log("please wait for your response...")

    const { ask, role } = req.body
    history.push({
        role: role,
        content: ask
    })

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: history
    })

    const reply = response.choices[0].message.content


    history.push({
        role: 'assistant',
        content: reply
    })
    console.log(history)
    console.log('-----------------------------------------------------')


    res.json({ reply })
}

app.post('/chat', main)
app.get('/clear', async (req, res) => {
    history.length = 0
    console.log('history removed')
    res.json({ status: "success", message: "History cleared" });
})
app.listen(2030, () => {
    console.log('server is running on http://localhost:2030')
})