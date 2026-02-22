<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order' => 'required|array',
            'order.*.id' => 'required|integer|exists:tasks,id',
            'order.*.category_id' => 'nullable|integer|exists:categories,id',
        ];
    }
}
