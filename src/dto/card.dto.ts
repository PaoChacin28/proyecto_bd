import { IsDateString, IsDefined, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class Card {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    @IsDateString()
    due_date?: string;

    @IsDefined()
    @IsUUID()
    listId: string;
}
