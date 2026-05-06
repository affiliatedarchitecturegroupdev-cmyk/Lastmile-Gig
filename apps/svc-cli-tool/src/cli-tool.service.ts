import { Injectable } from '@nestjs/common';

@Injectable()
export class CLIToolService {
  async executeCommand(command: string): Promise<{ output: string }> { return { output: 'Command executed' }; }
}