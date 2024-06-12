document.addEventListener('DOMContentLoaded', () => {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').value = today;

            document.getElementById('add-field-btn').addEventListener('click', addField);
            document.getElementById('add-entered-item-btn').addEventListener('click', addEnteredItem);
            document.getElementById('add-known-item-btn').addEventListener('click', addKnownItem);
        });

        const addField = () => {
            const fieldsDiv = document.getElementById('fields');
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field-group';
            fieldDiv.innerHTML = `
                <input type="text" placeholder="Field Name" name="fieldName[]">
                <input type="text" placeholder="Value" name="fieldValue[]">
            `;
            fieldsDiv.appendChild(fieldDiv);
        };

        const addEnteredItem = () => {
            const itemName = document.querySelector('input[name="productName"]').value;
            const fieldNames = Array.from(document.querySelectorAll('input[name="fieldName[]"]')).map(input => input.value);
            const fieldValues = Array.from(document.querySelectorAll('input[name="fieldValue[]"]')).map(input => input.value);

            if (!itemName) {
                alert('Item name is required.');
                return;
            }

            const enteredItemDiv = document.createElement('div');
            enteredItemDiv.className = 'entered-item';
            enteredItemDiv.dataset.type = 'dynamic';
            enteredItemDiv.innerHTML = `<strong>Item Name:</strong> ${itemName}`;

            fieldNames.forEach((fieldName, index) => {
                const fieldDiv = document.createElement('div');
                fieldDiv.innerText = `${fieldName}: ${fieldValues[index]}`;
                enteredItemDiv.appendChild(fieldDiv);
            });

            const actionButtonsDiv = document.createElement('div');
            actionButtonsDiv.className = 'action-buttons';
            actionButtonsDiv.innerHTML = `
                <button type="button" style="background-color:#000000" onclick="editItem(this)">Edit</button>
                <button type="button" style="background-color:#000000" onclick="deleteItem(this)">Delete</button>
            `;
            enteredItemDiv.appendChild(actionButtonsDiv);

            document.getElementById('entered-items-list').appendChild(enteredItemDiv);

            document.querySelector('input[name="productName"]').value = '';
            document.querySelectorAll('input[name="fieldName[]"]').forEach(input => input.value = '');
            document.querySelectorAll('input[name="fieldValue[]"]').forEach(input => input.value = '');
            document.getElementById('fields').innerHTML = '';
        };

        const addKnownItem = () => {
            const itemSelect = document.getElementById('known-item');
            const itemName = itemSelect.value === 'other' ? document.getElementById('other-item').value : itemSelect.value;
            const itemValue = document.getElementById('known-item-value').value;

            if (!itemName || !itemValue) {
                alert('Item name and value are required.');
                return;
            }

            const enteredItemDiv = document.createElement('div');
            enteredItemDiv.className = 'entered-item';
            enteredItemDiv.dataset.type = 'known';
            enteredItemDiv.dataset.itemName = itemName;
            enteredItemDiv.innerHTML = `<strong>Item Name:</strong> ${itemName}`;
            const fieldDiv = document.createElement('div');
            fieldDiv.innerText = `Value: ${itemValue}`;
            enteredItemDiv.appendChild(fieldDiv);

            const actionButtonsDiv = document.createElement('div');
            actionButtonsDiv.className = 'action-buttons';
            actionButtonsDiv.innerHTML = `
                <button type="button" style="background-color:#000000" onclick="editItem(this)">Edit</button>
                <button type="button" style="background-color:#000000" onclick="deleteItem(this)">Delete</button>
            `;
            enteredItemDiv.appendChild(actionButtonsDiv);

            document.getElementById('entered-items-list').appendChild(enteredItemDiv);

            document.getElementById('other-item').value = '';
            document.getElementById('known-item-value').value = '';
            if (itemSelect.value === 'other') {
                itemSelect.value = '';
            }
        };

        const editItem = (button) => {
            const itemDiv = button.closest('.entered-item');
            const itemType = itemDiv.dataset.type;

            if (itemType === 'known') {
                const itemName = itemDiv.dataset.itemName;
                const fieldValue = itemDiv.querySelector('div').innerText.replace('Value: ', '');

                const itemSelect = document.getElementById('known-item');
                itemSelect.value = itemName;

                if (itemName === 'other') {
                    document.getElementById('other-item').style.display = 'block';
                    document.getElementById('other-item').value = itemDiv.querySelector('strong').innerText.replace('Item Name: ', '');
                } else {
                    document.getElementById('other-item').style.display = 'none';
                }

                document.getElementById('known-item-value').value = fieldValue;
            } else if (itemType === 'dynamic') {
                const itemName = itemDiv.querySelector('strong').innerText.replace('Item Name: ', '');
                const fields = Array.from(itemDiv.querySelectorAll('div')).map(div => div.innerText.split(': '));

                document.querySelector('input[name="productName"]').value = itemName;
                document.getElementById('fields').innerHTML = '';

                fields.forEach(field => {
                    if (field[0] && field[1]) {
                        const fieldDiv = document.createElement('div');
                        fieldDiv.className = 'field-group';
                        fieldDiv.innerHTML = `
                            <input type="text" placeholder="Field Name" name="fieldName[]" value="${field[0]}">
                            <input type="text" placeholder="Value" name="fieldValue[]" value="${field[1]}">
                        `;
                        document.getElementById('fields').appendChild(fieldDiv);
                    }
                });
            }

            itemDiv.remove();
        };

        const deleteItem = (button) => {
            button.closest('.entered-item').remove();
        };

       const handleSubmit = (event) => {
    event.preventDefault();
    if (!navigator.onLine) {
        alert('No internet connection.');
        return;
    }

    const formData = new FormData(event.target);

    // Extracting date
    const date = formData.get('date');

    // Extracting entered items
    const enteredItems = document.querySelectorAll('.entered-item');
    const enteredItemsArray = Array.from(enteredItems).map(item => {
        const itemName = item.querySelector('strong').innerText.replace('Item Name: ', '');
        const fields = Array.from(item.querySelectorAll('div')).map(div => {
            const parts = div.innerText.split(': ');
            return { name: parts[0], value: parts[1] };
        });
        return { itemName, fields };
    });

    // Combining username and other name into a single field
    const userName = formData.get('username') === 'other' ? formData.get('otherName') : formData.get('username');

    // Constructing the data object
    const dataObject = {
        name: userName,
        date,
        enteredItems: enteredItemsArray
    };

    console.log('Data Object:', dataObject);
    var url = "https://script.google.com/macros/s/AKfycbz1BWaKnVMjqPf1N3kwjveHZ8nJHOR8mAUhDLEjmoou97pwPOefaxnnPtWpvu94D1P8/exec";
    // Posting data to the server
    fetch(url, {
        method: 'POST',
	mode: 'cors',
        body: JSON.stringify(dataObject),
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            console.log('Response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Data:', data);
            if (data.status === 'success') {
                alert('Form submitted successfully.');
                document.getElementById('combined-form').reset();
                document.getElementById('date').value = new Date().toISOString().split('T')[0];
                document.getElementById('entered-items-list').innerHTML = '';
            } else {
                throw new Error('Failed to submit form.');
            }
        })
        .catch((error) => {
            alert('Failed to submit the form.');
            //console.error('Error:', error);
        });
};


        document.addEventListener('focusin', (event) => {
            const target = event.target;
            if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
