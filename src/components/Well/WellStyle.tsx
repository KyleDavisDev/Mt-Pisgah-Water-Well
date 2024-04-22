import styled from "../../theme/styled-components";

export const StyledDiv = styled.div`
    max-width: 2000px;
    width: 100%;
    margin: 0 0;
    border: ${props => props.theme.border};
    display: flex;
    flex-direction: column;
    transition: all 0.2 ease;
    padding: 16px;
    justify-content: flex-start;

    a:last-child {
        margin: auto auto 0;
    }
`;
StyledDiv.displayName = "div";
