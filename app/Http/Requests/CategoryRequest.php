<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'parent_id' => 'nullable|integer|exists:categories,id',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $parentId = $this->input('parent_id');
            if ($parentId) {
                $parent = Category::find($parentId);
                if ($parent && $parent->parent_id !== null) {
                    $validator->errors()->add('parent_id', 'Unterkategorien können nicht verschachtelt werden.');
                }
            }
        });
    }
}
