let { promiseExec } = require('../cmd_util.js')
let { config } = require('../../config.js')
let fs = require('fs/promises')
let { clean } = require('../eye/eye.js')

const out = config.out;
const folder = config.tools.spin3.folder;
const sparql2spin = config.tools.triplify.exec

exports.exec = async function(options, data, query) {    
    const subTask = options.subTask;

    const times = []

    // const spin_file = `${folder}/out/query.spin`
    const spin_file = `${out}/query.spin`
    // let cmd = `TIMEFORMAT="%R"; { time { java -jar ${sparql2spin} -sparql ${query} -multi > ${spin_file}; } }`
    let cmd = `java -jar ${sparql2spin} -sparql ${query} -multi > ${spin_file};`
    const [ , genSpinTime ] = await promiseExec(cmd);
    times.push(`generate spin: ${genSpinTime.trim()}`)

    // const n3_file = `${folder}/out/n3query.n3`
    const n3_file = `${out}/n3query.n3`
    // cmd = `TIMEFORMAT="%R"; { time { eye ${spin_file} ${folder}/auxiliary-files/aux.n3 --query ${folder}/queries/query_general.n3 --nope --quantify http://eyereasoner.github.io/.well-known/genid/ > ${n3_file} 2>/dev/null; } }`
    cmd = `eye ${spin_file} ${folder}/auxiliary-files/aux.n3 --query ${folder}/queries/query_general.n3 --nope --quantify http://eyereasoner.github.io/.well-known/genid/ > ${n3_file} 2>/dev/null;`
    const [ , genN3Time ] = await promiseExec(cmd);
    times.push(`generate n3: ${genN3Time.trim()}`)

    let eyeCmd = `eye ${folder}/auxiliary-files/runtime.n3 ${data} --query ${n3_file} --nope`
    switch (subTask) {
        case 'derivations':
            eyeCmd += " --pass-only-new"
            break
        case 'deductive_closure':
            eyeCmd += " --pass-all"
            break
    }
    // cmd = `TIMEFORMAT="%R"; { time { ${eyeCmd} 2>/dev/null; } }`
    cmd = `${eyeCmd} 2>/dev/null;`
    let [ output, execN3Time ] = await promiseExec(cmd);
    times.push(`execute n3: ${execN3Time.trim()}`)

    output = clean(output, data)

    // const spin = await fs.readFile(spin_file) + ""
    // const n3 = await fs.readFile(n3_file) + ""

    return { 
        data: output,
        times: times,
        spin: "out/query.spin",
        n3: "out/n3query.n3"
    }
}