import { test } from "node:test";
import assert from "node:assert/strict";
import { sugerirCandidato } from "./candidato.js";
const paciente = {lat:-31.42,lng:-64.18};
const base = (id,lat,lng) => ({id,nombreCompleto:id,coordenadas:{lat,lng}});
test("No recomienda sin ubicación del paciente",()=> assert.equal(sugerirCandidato(null,[base("a",-31,-64)]).candidato,null));
test("No inventa un desempate cuando comparten centro",()=> assert.equal(sugerirCandidato(paciente,[base("a",-31.42,-64.18),base("b",-31.42,-64.18)]).candidato,null));
test("Sugiere el más cercano solamente cuando puede distinguirlos",()=>assert.equal(sugerirCandidato(paciente,[base("lejos",-32,-64),base("cerca",-31.42,-64.18)]).candidato.id,"cerca"));
test("No compara un único geolocalizado frente a varios sin ubicación",()=>assert.equal(sugerirCandidato(paciente,[base("a",-31.42,-64.18),{id:"b",coordenadas:null}]).candidato,null));
