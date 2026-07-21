import process from 'node:process';
import { collectContent, validateContent } from './lib/content-validation.mjs';

const strict = process.env.STRICT_CONTENT === '1';
const content = await collectContent(process.cwd());
const { errors, warnings } = validateContent(content, { strict });

for (const warning of warnings) console.warn(`[content warning] ${warning}`);
for (const error of errors) console.error(`[content error] ${error}`);

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(
    `Content validation passed${strict ? ' in strict release mode' : ''} with ${warnings.length} warning(s).`,
  );
}
