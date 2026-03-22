#!/usr/bin/env node

/**
 * OPAL Bridge CLI
 * 
 * Command-line interface for OPAL integration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { OpalBridge, createOpalBridge, ExtractedEntity } from './index.js';

const program = new Command();

program
  .name('opal-bridge')
  .description('OPAL Bridge for Organizational OS — AI-powered knowledge gardens')
  .version('1.0.0');

// Status command
program
  .command('status')
  .description('Show OPAL status')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (options) => {
    try {
      const bridge = await createOpalBridge(options.config);
      const status = await bridge.getStatus();
      
      console.log(chalk.blue('\\nOPAL Bridge Status:'));
      console.log(`  Status: ${status.status === 'connected' ? chalk.green('✓') : chalk.red('✗')} ${status.status}`);
      console.log(`  Version: ${status.version || 'unknown'}`);
      console.log(`  Profile: ${status.profile || 'default'}`);
      console.log(`  Pending items: ${status.pendingItems}`);
    } catch (error) {
      console.error(chalk.red(`Failed: ${error}`));
      process.exit(1);
    }
  });

// Process command
program
  .command('process')
  .description('Process content file through OPAL')
  .argument('<file>', 'Path to content file')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (file, options) => {
    const spinner = ora('Processing through OPAL...').start();
    
    try {
      const bridge = await createOpalBridge(options.config);
      const entities: ExtractedEntity[] = await bridge.process(file);
      
      spinner.stop();
      
      console.log(chalk.blue(`\\nExtracted ${entities.length} entities:`));
      for (const entity of entities) {
        const icon = entity.type === 'person' ? '👤' :
                    entity.type === 'organization' ? '🏢' :
                    entity.type === 'pattern' ? '🔮' : '📄';
        console.log(`  ${icon} ${chalk.cyan(entity.name)} (${entity.type}) ${Math.round(entity.confidence * 100)}%`);
      }
      
      if (entities.length > 0) {
        console.log(chalk.yellow(`\\nRun 'opal-bridge review' to approve/reject entities`));
      }
    } catch (error) {
      spinner.fail(`Processing failed: ${error}`);
      process.exit(1);
    }
  });

// Review command
program
  .command('review')
  .description('Review pending entities')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (options) => {
    try {
      const bridge = await createOpalBridge(options.config);
      const pending = await bridge.getPending();
      
      if (pending.length === 0) {
        console.log(chalk.green('\\nNo pending entities to review'));
        return;
      }
      
      console.log(chalk.blue(`\\n${pending.length} entities pending review:`));
      
      for (const entity of pending) {
        console.log(`\\n  ${chalk.cyan(entity.name)} (${entity.type})`);
        console.log(`    Confidence: ${Math.round(entity.confidence * 100)}%`);
        console.log(`    Source: ${entity.source}`);
        console.log(chalk.yellow(`    Approve: opal-bridge approve ${entity.id}`));
        console.log(chalk.yellow(`    Reject:  opal-bridge reject ${entity.id}`));
      }
    } catch (error) {
      console.error(chalk.red(`Review failed: ${error}`));
      process.exit(1);
    }
  });

// Approve command
program
  .command('approve')
  .description('Approve an entity')
  .argument('<id>', 'Entity ID')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (id, options) => {
    const spinner = ora(`Approving ${id}...`).start();
    
    try {
      const bridge = await createOpalBridge(options.config);
      await bridge.approve(id);
      spinner.succeed(`Approved: ${id}`);
    } catch (error) {
      spinner.fail(`Failed: ${error}`);
      process.exit(1);
    }
  });

// Reject command
program
  .command('reject')
  .description('Reject an entity')
  .argument('<id>', 'Entity ID')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (id, options) => {
    const spinner = ora(`Rejecting ${id}...`).start();
    
    try {
      const bridge = await createOpalBridge(options.config);
      await bridge.reject(id);
      spinner.succeed(`Rejected: ${id}`);
    } catch (error) {
      spinner.fail(`Failed: ${error}`);
      process.exit(1);
    }
  });

// Ask command (semantic search)
program
  .command('ask')
  .description('Semantic search across knowledge base')
  .argument('<query>', 'Natural language query')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (query, options) => {
    const spinner = ora('Searching knowledge base...').start();
    
    try {
      const bridge = await createOpalBridge(options.config);
      const results = await bridge.ask(query);
      
      spinner.stop();
      
      console.log(chalk.blue(`\\nResults for: "${query}"`));
      for (const result of results) {
        console.log(`  ${chalk.cyan(result.name || 'Unknown')}`);
      }
    } catch (error) {
      spinner.fail(`Search failed: ${error}`);
      process.exit(1);
    }
  });

// Quest command
program
  .command('quest')
  .description('Start or continue research quest')
  .argument('<topic>', 'Research topic')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (topic, options) => {
    try {
      const bridge = await createOpalBridge(options.config);
      const quest = await bridge.quest(topic);
      
      console.log(chalk.green('\\nQuest started:'));
      console.log(`  ID: ${quest.id}`);
      console.log(`  Topic: ${quest.topic}`);
      console.log(chalk.yellow(`\\nContinue with: opal-bridge quest-continue ${quest.id} "your findings"`));
    } catch (error) {
      console.error(chalk.red(`Failed: ${error}`));
      process.exit(1);
    }
  });

// Quest continue command
program
  .command('quest-continue')
  .description('Continue existing quest')
  .argument('<id>', 'Quest ID')
  .argument('<content>', 'Findings to add')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (id, content, options) => {
    try {
      const bridge = await createOpalBridge(options.config);
      await bridge.questContinue(id, content);
      
      console.log(chalk.green(`\\nUpdated quest ${id}`));
    } catch (error) {
      console.error(chalk.red(`Failed: ${error}`));
      process.exit(1);
    }
  });

// Handoff command
program
  .command('handoff')
  .description('Create handoff note for team')
  .argument('<content>', 'Handoff content')
  .option('-a, --assignee <name>', 'Assignee name')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (content, options) => {
    try {
      const bridge = await createOpalBridge(options.config);
      await bridge.handoff(content, options.assignee);
      
      console.log(chalk.green('\\nHandoff created'));
    } catch (error) {
      console.error(chalk.red(`Failed: ${error}`));
      process.exit(1);
    }
  });

// Activity command
program
  .command('activity')
  .description('Show recent OPAL activity')
  .option('-c, --config <path>', 'Config file path', 'federation.yaml')
  .action(async (options) => {
    try {
      const bridge = await createOpalBridge(options.config);
      const activity = await bridge.activity();
      
      console.log(chalk.blue('\\nRecent OPAL Activity:'));
      for (const item of activity) {
        console.log(`  ${item.timestamp}: ${item.description}`);
      }
    } catch (error) {
      console.error(chalk.red(`Failed: ${error}`));
      process.exit(1);
    }
  });

program.parse();
