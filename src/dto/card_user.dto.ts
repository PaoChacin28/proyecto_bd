// En un archivo llamado 
import { IsBoolean, IsUUID } from 'class-validator';

export class CardUser {
    @IsUUID()
    cardId: string;

    @IsUUID()
    userId: string;

    @IsBoolean()
    isOwner: boolean;
}

