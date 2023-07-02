import { Configuration, OpenAIApi } from "openai"

export const handler = async (event) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  })
  const openai = new OpenAIApi(configuration)

  const content = event.headers["question"]

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content }],
  })

  const response = {
    statusCode: 200,
    body: chatCompletion.data.choices[0].message,
  }
  return response
}
