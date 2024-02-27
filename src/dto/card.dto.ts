import { IsDateString, IsDefined, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class Card {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    @IsDateString()
    due_date?: string;

    @IsNotEmpty()
    @IsDefined()
    @IsUUID()
    listId: string;

    @IsNotEmpty()
    @IsDefined()
    @IsUUID()
    userId: string;
}
