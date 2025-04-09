import fs from "fs/promises"
import path from "path"

export const logger = {
  debug: async (message: string, data?: any) => {
    const log = `[DEBUG] ${new Date().toISOString()} - ${message} ${
      data ? JSON.stringify(data, null, 2) : ""
    }\n`

    if (process.env.NODE_ENV === "development") {
      console.log(log)
    }

    try {
      await fs.appendFile(path.join(process.cwd(), "logs", "debug.log"), log)
    } catch (error) {
      console.error("Failed to write log:", error)
    }
  },
}
