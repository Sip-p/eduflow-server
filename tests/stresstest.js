import autocannon from 'autocannon';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const baseUrl = 'http://localhost:5000'; // ✅ no trailing space

// ── Real users from your DB ────────────────────────────────
const verifiedStudent = {
    email: 'sip74panda@gmail.com',
    password: 'Sipra@2026' // ⚠️ fill in real password
};

const verifiedTeacher = {
    email: '22btcse74@suiit.ac.in',
    password: 'Sipra@2026' // ⚠️ fill in real password
};

// Real email verification tokens from your DB
// const studentVerifyToken = '9e2bc74ed9f645c49dae6bae5ee174198f5a1dc06d6ea9bd7ffdebc10227b645'; // hio@gmail.com
// const studentVerifyToken2 = 'cf6bc48d0fcf8bc07965a31ca42776cbe6eb0ab453f3366076cc92aefae65571'; // hio1@gmail.com

async function runStressTest() {
    console.log('🚀 Starting stress test...\n');

    const result = await autocannon({
        url: baseUrl,
        connections: 100,
        pipelining: 1,
        duration: 30,
        requests: [
            // ── 1. Login with verified student ──────────────
            {
                path: '/api/auth/user-login',
                method: 'POST',
                body: JSON.stringify({
                    email: verifiedStudent.email,
                    password: verifiedStudent.password
                }),
                headers: { 'Content-Type': 'application/json' }
            },

            // ── 2. Login with verified teacher ──────────────
            {
                path: '/api/auth/user-login',
                method: 'POST',
                body: JSON.stringify({
                    email: verifiedTeacher.email,
                    password: verifiedTeacher.password
                }),
                headers: { 'Content-Type': 'application/json' }
            },

            // ── 3. Verify email with real token (unverified user) ──
            // {
            //     path: `/api/auth/verify-email/${studentVerifyToken}`,
            //     method: 'GET'
            // },

            // // ── 4. Verify email with second real token ───────
            // {
            //     path: `/api/auth/verify-email/${studentVerifyToken2}`,
            //     method: 'GET'
            // },

            // ── 5. Reset request with real email ─────────────
            {
                path: '/api/auth/reset-request',
                method: 'POST',
                body: JSON.stringify({ email: verifiedStudent.email }),
                headers: { 'Content-Type': 'application/json' }
            },

            // ── 6. Signup with unique email each cycle ────────
            // Note: will fail after first run (duplicate email)
            // Use for first run only or clear DB between runs
            {
                path: '/api/auth/user-signup',
                method: 'POST',
                body: JSON.stringify({
                    email: `stresstest_${Date.now()}@test.com`,
                    password: 'StressTest@123',
                    name: 'Stress Test User'
                }),
                headers: { 'Content-Type': 'application/json' }
            }
        ]
    });

    // ── Save logs ──────────────────────────────────────────
    if (!existsSync('./logs')) mkdirSync('./logs');

    const timestamp = Date.now();
    writeFileSync(
        `./logs/stress-result-${timestamp}.json`,
        JSON.stringify(result, null, 2)
    );

    // ── Print results ──────────────────────────────────────
    autocannon.printResult(result);

    console.log('\n📊 Key Metrics:');
    console.log(`  Requests/sec avg  : ${result.requests.average}`);
    console.log(`  Requests/sec max  : ${result.requests.max}`);
    console.log(`  Latency avg       : ${result.latency.average}ms`);
    console.log(`  Latency p99       : ${result.latency.p99}ms`);
    console.log(`  Latency max       : ${result.latency.max}ms`);
    console.log(`  Throughput avg    : ${(result.throughput.average / 1024).toFixed(2)} KB/sec`);
    console.log(`  Errors            : ${result.errors}`);
    console.log(`  Timeouts          : ${result.timeouts}`);
    console.log(`  2xx responses     : ${result['2xx']}`);
    console.log(`  Non-2xx responses : ${result.non2xx}`);
    console.log(`\n  📁 Full results saved → ./logs/stress-result-${timestamp}.json`);

    // ── Health check ───────────────────────────────────────
    const total = result['2xx'] + result.non2xx;
    const successRate = ((result['2xx'] / total) * 100).toFixed(1);
    console.log(`\n  ✅ Success rate: ${successRate}%`);

    if (result.latency.p99 > 500) {
        console.log('  ⚠️  WARNING: p99 latency > 500ms — server may be struggling');
    }
    if (result.errors > 0) {
        console.log('  ❌ WARNING: Errors detected — check server logs');
    }
}

runStressTest().catch(console.error);