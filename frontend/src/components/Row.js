import { Td, Tr } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import './Grid.css';


function Row(props) {
    return (
        <Tr>
            {
                props.columns.map(column => 
                    <Td>{props.row[column["key"]]}</Td>
                )
            }
        </Tr>
    );
}

export default Row;