import { AuditLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

class AuditService {
  private logs: AuditLog[] = [];

  public logEvent(
    patientId: string,
    action: AuditLog['action'],
    targetObject: string,
    targetId: string,
    userId: string = 'usr_clinician_admin',
    userName: string = 'Dr. Alex Rivera',
    previousValue?: any,
    newValue?: any,
    reason?: string
  ): AuditLog {
    const log: AuditLog = {
      id: uuidv4(),
      patientId,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      targetObject,
      targetId,
      previousValue,
      newValue,
      reason
    };
    this.logs.unshift(log); // newest first
    return log;
  }

  public getLogsForPatient(patientId: string): AuditLog[] {
    return this.logs.filter(l => l.patientId === patientId);
  }

  public getAllLogs(): AuditLog[] {
    return this.logs;
  }

  public seedLogs(initialLogs: AuditLog[]) {
    this.logs = [...initialLogs, ...this.logs];
  }
}

export const auditService = new AuditService();
