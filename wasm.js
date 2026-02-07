let wasm;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function initWasm(path = "./namumark.wasm") {
  const res = await fetch(path);
  const bytes = await res.arrayBuffer();

  const { instance } = await WebAssembly.instantiate(bytes);
  wasm = instance.exports;
}

export function render(text) {
  if (!wasm) {
    throw new Error("initWasm() 사용해주세용");
  }

  const bytes = encoder.encode(text);

  const ptr = wasm.alloc(bytes.length);

  new Uint8Array(wasm.memory.buffer, ptr, bytes.length).set(bytes);

  const outPtr = wasm.render_html(ptr, bytes.length);
  const outLen = wasm.get_buffer_len();

  const result = decoder.decode(
    new Uint8Array(wasm.memory.buffer, outPtr, outLen),
  );

  wasm.dealloc(ptr, bytes.length);

  return result;
}
