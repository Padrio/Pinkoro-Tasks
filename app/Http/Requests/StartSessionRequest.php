<?php

namespace App\Http\Requests;

use App\Enums\SessionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StartSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task_id' => 'nullable|exists:tasks,id',
            'type' => ['required', Rule::enum(SessionType::class)],
            'duration_minutes' => 'required|integer|min:1|max:120',
        ];
    }
}
