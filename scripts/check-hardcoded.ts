import fs from 'fs';
import path from 'path';

/**
 * CI verification script: checks that src/ contains no hardcoded mock data,
 * sample names from Stitch prototypes, or hardcoded currency amounts in JSX.
 */

const BANNED_PATTERNS = [
  { name: 'Prototype name "Riya"', regex: /\bRiya\b/g },
  { name: 'Prototype name "Arjun"', regex: /\bArjun\b/g },
  { name: 'Prototype venue "Leela"', regex: /\bLeela\b/g },
  { name: 'Prototype city "Jaipur"', regex: /\bJaipur\b/g },
  { name: 'Hardcoded INR currency literal in JSX', regex: />\s*₹\s*\d+/g },
  { name: 'Hardcoded Lakh literal in JSX', regex: />\s*₹?\s*\d+(\.\d+)?\s*L\s*</g },
];

const SRC_DIR = path.resolve(process.cwd(), 'src');
let hasError = false;

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      // Allow check:hardcoded to check config/copy.ts for example placeholders
      const content = fs.readFileSync(fullPath, 'utf-8');
      const relativePath = path.relative(process.cwd(), fullPath);

      // Check each banned pattern
      for (const pattern of BANNED_PATTERNS) {
        // Special case: In UI_COPY placeholders we allow descriptive guidance placeholder e.g. "Jaipur"
        if (relativePath === 'src/config/copy.ts' && pattern.name.includes('Prototype')) {
          continue;
        }

        const matches = content.match(pattern.regex);
        if (matches && matches.length > 0) {
          console.error(`❌ [check:hardcoded] Violation found in ${relativePath}:`);
          console.error(`   Found ${pattern.name} (${matches.length} occurrence(s))`);
          hasError = true;
        }
      }
    }
  }
}

console.log('🔍 Running check:hardcoded against src/ directory...');
scanDirectory(SRC_DIR);

if (hasError) {
  console.error('\n❌ check:hardcoded FAILED. Remove hardcoded prototype data and replace with database/LLM/computation.');
  process.exit(1);
} else {
  console.log('✅ check:hardcoded PASSED: Zero hardcoded mock names or currency literals found in src/.');
  process.exit(0);
}
