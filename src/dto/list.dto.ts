
import { IsNotEmpty, IsUUID } from 'class-validator';

export class List {
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    boardId: string;
}
