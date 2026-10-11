const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../src/lib');
function load(name, mocks = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, name + '.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, console: { log() {}, error() {} },
    require: key => mocks[key] ?? load(key.replace('./', ''), mocks), Date, Set, Math });
  return module.exports;
}
const { resolveJourneyProgress } = load('journey-progress');
function rows(n) { return Array.from({length:n}, (_,i) => ({stageNumber:i+1,status:'completed'})); }
for (const [name, completed, stage] of [
  ['starts weeks after registration',0,1], ['slow progress over 40 days',1,2],
  ['several stages in one day',6,7], ['interruption',12,13], ['long absence',22,23],
  ['completed journey remains at 40',40,40],
]) {
  test(name, async () => {
    const progress = rows(completed);
    assert.equal(resolveJourneyProgress(progress).currentStage, stage);
    const queries = [];
    const legacyPea = {day_number:40,thought:'original',emotion:'calma',action:'respirar',created_at:'2026-01-01'};
    const before = JSON.stringify(legacyPea);
    const supabase = { from(table) {
      const q = { select() {return q;}, eq() {return q;}, order(column) {queries.push([table,column]);return q;}, limit() {return q;}, maybeSingle() {return q;},
        then(resolve) { queries.push([table]); resolve({data: table === 'stage_progress' ? progress.map(r=>({stage_number:r.stageNumber,status:r.status})) : table === 'pea_entries' ? [legacyPea] : null,error:null}); }
      }; return q;
    }};
    const engine = load('ego-engine', {'./supabase':{supabase}});
    const ctx = await engine.fetchEgoContext('user');
    assert.equal(ctx.currentStage, stage);
    assert.match(engine.generateWelcome(ctx), new RegExp(`Etapa ${stage}\\.`));
    assert.equal(engine.buildEgoMemory('user',ctx).current_day, stage);
    assert.equal(JSON.stringify(legacyPea),before);
    assert.ok(queries.some(q=>q[0]==='pea_entries' && q[1]==='created_at'));
    assert.ok(!queries.some(q=>q[0]==='profiles' || q[0]==='journey_state'));
  });
}
test('gaps, duplicate rows and invalid numbers do not skip stages',()=>{
  const p=resolveJourneyProgress([...rows(1), ...rows(1), {stageNumber:3,status:'completed'}, {stageNumber:0,status:'completed'}, {stageNumber:41,status:'in_progress'}]);
  assert.equal(p.currentStage,2); assert.equal(p.completedCount,2); assert.equal(p.isProcessComplete,false);
});
test('Supabase progress query failure is not mistaken for stage one',async()=>{
  const error=new Error('offline');
  const q={select(){return q},eq(){return q},order(){return q},limit(){return q},maybeSingle(){return q},then(resolve){resolve({data:null,error})}};
  const engine=load('ego-engine',{'./supabase':{supabase:{from(){return q}}}});
  await assert.rejects(engine.fetchEgoContext('user'), /offline/);
});
test('PEA collision preserves the existing entry and reports failure',async()=>{
  const legacy={id:'old',day_number:1,thought:'original',emotion:'calma',action:'respirar',created_at:'2026-01-01'};
  const before=JSON.stringify(legacy); let payload; let stateWrites=0;
  const q={select(){return q},single(){return Promise.resolve({data:null,error:{code:'23505'}})}};
  const mocks={
    react:{createContext(){return {Provider:'provider'}},useState(initial){return [initial===true?false:initial,()=>stateWrites++]},useEffect(){}},
    'react/jsx-runtime':{jsx(type,props){return {type,props}}},
    './auth-context':{useAuth(){return {user:{id:'user'}}}},
    './stage-context':{useStages(){return {currentStage:1,isLoading:false,loadError:false}}},
    './supabase':{supabase:{from(table){assert.equal(table,'pea_entries');return {insert(value){payload=value;return q}}}}}
  };
  const module={exports:{}};
  const code=ts.transpileModule(fs.readFileSync(path.join(root,'store-context.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:key=>mocks[key],console:{error(){}},Date});
  const provider=module.exports.StoreProvider({children:null});
  assert.equal(await provider.props.value.addReflection('new','new','new'),false);
  assert.equal(payload.day_number,1); assert.equal(stateWrites,0); assert.equal(JSON.stringify(legacy),before);
});
