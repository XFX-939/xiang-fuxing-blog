import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = path.join(root, specifier.slice(2));
    for (const candidate of [target, `${target}.ts`, `${target}.tsx`, `${target}.js`]) {
      if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
    }
  }
  try { return await nextResolve(specifier, context); }
  catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND" && context.parentURL && /^\.{1,2}\//.test(specifier)) {
      for (const extension of [".ts", ".tsx", ".js"]) {
        const candidate = new URL(`${specifier}${extension}`, context.parentURL);
        if (existsSync(candidate)) return { url: candidate.href, shortCircuit: true };
      }
    }
    if (error.code === "ERR_MODULE_NOT_FOUND" && specifier.startsWith("next/")) {
      return nextResolve(`${specifier}.js`, context);
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && /\.[cm]?tsx?$/.test(new URL(url).pathname)) {
    const source = await readFile(new URL(url), "utf8");
    const compiled = ts.transpileModule(source, {
      fileName: fileURLToPath(url),
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, inlineSourceMap: true }
    });
    return { format: "module", source: compiled.outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}
