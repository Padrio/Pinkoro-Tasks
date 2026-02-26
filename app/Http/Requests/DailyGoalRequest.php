<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DailyGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'end_time' => 'nullable|date_format:H:i',
            'tasks' => 'present|array',
            'tasks.*.task_id' => 'required|integer|exists:tasks,id',
            'tasks.*.time_slot_start' => 'nullable|date_format:H:i',
            'tasks.*.time_slot_end' => 'nullable|date_format:H:i',
        ];
    }
}
