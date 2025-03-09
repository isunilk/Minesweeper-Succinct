use wasm_bindgen::prelude::*;
use sp1_verifier::{Groth16Verifier, GROTH16_VK_BYTES};

#[wasm_bindgen]
pub fn verify_proof(proof: &[u8], public_inputs: &[u8], sp1_vk_hash: &str) -> bool {
    Groth16Verifier::verify(proof, public_inputs, sp1_vk_hash, *GROTH16_VK_BYTES).is_ok()
}

#[wasm_bindgen]
pub fn decode_public_inputs(public_inputs: &[u8]) -> JsValue {
    let view = js_sys::DataView::new(&public_inputs.into());
    let score = view.get_uint32(0, true);
    let time = view.get_uint32(4, true);
    let cells_revealed = view.get_uint32(8, true);
    let total_safe_cells = view.get_uint32(12, true);
    
    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"score".into(), &score.into()).unwrap();
    js_sys::Reflect::set(&obj, &"time".into(), &time.into()).unwrap();
    js_sys::Reflect::set(&obj, &"cellsRevealed".into(), &cells_revealed.into()).unwrap();
    js_sys::Reflect::set(&obj, &"totalSafeCells".into(), &total_safe_cells.into()).unwrap();
    
    obj.into()
}