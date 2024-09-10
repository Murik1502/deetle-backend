import { Controller } from '@nestjs/common';
import { TimeBlockService } from './time-block.service';

@Controller('time-block')
export class TimeBlockController {
  constructor(private readonly timeBlockService: TimeBlockService) {}
}
