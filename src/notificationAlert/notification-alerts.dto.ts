// notification-alerts.dto.ts

export class CreateNotificationAlertDto {
  userId: string;
  sourceId: string;
  fromId: string;
  type: string;
  message: string;
  seenStatus: string;
  status: number;
}

export class UpdateStatusDto {
  id: string;
  status: number;
}

export class UpdateSeenStatusDto {
  id: string;
  seenStatus: string;
}

export class GetByUserIdDto {
  userId: string;
}

export class UpdateAllSeenStatusDto {
  userId: string;
  seenStatus: string;
}

export class UpdateUserIdDto {

  oldId: string;
  newId: string;
}

