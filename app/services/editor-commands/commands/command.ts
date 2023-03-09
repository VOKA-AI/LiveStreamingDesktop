export abstract class Command {
  // 设计模式：Command
  abstract description: string;

  abstract execute(): any;
  abstract rollback(): any;
}
