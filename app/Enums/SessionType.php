<?php

namespace App\Enums;

enum SessionType: string
{
    case Pomodoro = 'pomodoro';
    case ShortBreak = 'short_break';
    case LongBreak = 'long_break';
    case Custom = 'custom';
}
