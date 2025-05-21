import gradio as gr

def calculate(num1, num2, operation):
    if operation == "Add":
        return num1 + num2
    elif operation == "Subtract":
        return num1 - num2
    elif operation == "Multiply":
        return num1 * num2
    elif operation == "Divide":
        if num2 == 0:
            return "Error: Cannot divide by zero"
        return num1 / num2
    elif operation == "Power":
        return num1 ** num2
    else:
        return "Invalid operation"

# Create the interface
with gr.Blocks(title="Simple Calculator") as calculator:
    gr.Markdown("# Simple Calculator")
    gr.Markdown("Enter two numbers and choose an operation")
    
    with gr.Row():
        with gr.Column():
            num1_input = gr.Number(label="First Number", value=0)
            num2_input = gr.Number(label="Second Number", value=0)
            operation_dropdown = gr.Dropdown(
                choices=["Add", "Subtract", "Multiply", "Divide", "Power"],
                label="Operation",
                value="Add"
            )
            calculate_btn = gr.Button("Calculate")
        
        with gr.Column():
            result_output = gr.Number(label="Result")
            
    calculate_btn.click(
        fn=calculate,
        inputs=[num1_input, num2_input, operation_dropdown],
        outputs=result_output
    )

# Launch the app
if __name__ == "__main__":
    calculator.launch()