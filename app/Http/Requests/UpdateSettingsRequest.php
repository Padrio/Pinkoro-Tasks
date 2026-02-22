<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pomodoro_duration' => 'sometimes|integer|min:1|max:120',
            'short_break_duration' => 'sometimes|integer|min:1|max:60',
            'long_break_duration' => 'sometimes|integer|min:1|max:60',
            'sound_enabled' => 'sometimes|boolean',
            'sound_volume' => 'sometimes|integer|min:0|max:100',
            'sound_pomodoro_end' => 'sometimes|string|in:glockenspiel,sanfter_dreiklang,aufstieg,glocke,doppelton,abschluss,harfe,tropfen,keine',
            'sound_break_end' => 'sometimes|string|in:glockenspiel,sanfter_dreiklang,aufstieg,glocke,doppelton,abschluss,harfe,tropfen,keine',
            'sound_task_complete' => 'sometimes|string|in:glockenspiel,sanfter_dreiklang,aufstieg,glocke,doppelton,abschluss,harfe,tropfen,keine',
        ];
    }
}
