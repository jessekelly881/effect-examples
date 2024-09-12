import { createStreaming } from "@dprint/formatter"
import * as Fs from "node:fs/promises"

/** @type {import("@dprint/formatter").GlobalConfiguration} */
const globalConfig = {
  indentWidth: 2,
  lineWidth: 120
}

async function main() {
  const tsFormatter = await createStreaming(
    // check https://plugins.dprint.dev/ for latest plugin versions
    // eslint-disable-next-line no-undef
    fetch("https://plugins.dprint.dev/typescript-0.91.8.wasm")
  )

  tsFormatter.setConfig(globalConfig, {
    semiColons: "asi",
    quoteStyle: "alwaysDouble",
    trailingCommas: "never",
    operatorPosition: "maintain",
    "arrowFunction.useParentheses": "force"
  })

  const template = await Fs.readFile("./scripts/examples.template.txt")
    .then((buffer) => buffer.toString("utf8"))
  const examples = await Fs.readdir("./examples", { withFileTypes: true })
    .then((entries) =>
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    )

  await Fs.writeFile(
    "./packages/create-effect-app/src/internal/examples.ts",
    tsFormatter.formatText({
      filePath: "file.ts",
      fileText: template
        .replace("EXAMPLE_VALUES", JSON.stringify(examples))
        .replace("EXAMPLE_TYPE", examples.map(JSON.stringify).join(" | "))
    })
  )
}

main()